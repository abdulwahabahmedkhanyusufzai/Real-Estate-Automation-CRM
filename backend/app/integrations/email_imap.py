import imaplib
import email
from email.header import decode_header
import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

IMAP_HOST = os.getenv("IMAP_HOST", "")
IMAP_PORT = int(os.getenv("IMAP_PORT", "993"))
IMAP_USER = os.getenv("IMAP_USER", "")
IMAP_PASSWORD = os.getenv("IMAP_PASSWORD", "")


def get_email_body(msg: email.message.Message) -> str:
    """
    Recursively extracts the plain text body from an email message structure.
    """
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                try:
                    return part.get_payload(decode=True).decode(
                        "utf-8", errors="ignore"
                    )
                except Exception:
                    pass
    else:
        try:
            return msg.get_payload(decode=True).decode("utf-8", errors="ignore")
        except Exception:
            pass
    return ""


def fetch_unread_emails(
    host: Optional[str] = None,
    port: Optional[int] = None,
    user: Optional[str] = None,
    password: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Connects to the configured IMAP server, polls for unread messages,
    parses them, and returns them as structured dictionaries.
    """
    conn_host = host or IMAP_HOST
    conn_port = port or IMAP_PORT
    conn_user = user or IMAP_USER
    conn_pass = password or IMAP_PASSWORD

    if not conn_host or not conn_user or not conn_pass:
        logger.warning(
            "IMAP email credentials are not fully configured. Skipping synchronization."
        )
        return []

    unread_leads = []

    try:
        # Establish SSL connection
        mail = imaplib.IMAP4_SSL(conn_host, conn_port)
        mail.login(conn_user, conn_pass)
        mail.select("inbox")

        # Search for unread (UNSEEN) emails
        status, response = mail.search(None, "UNSEEN")
        if status != "OK":
            logger.error("Failed to search email inbox.")
            return []

        email_ids = response[0].split()
        logger.info(f"Found {len(email_ids)} unread emails.")

        for e_id in email_ids:
            status, data = mail.fetch(e_id, "(RFC822)")
            if status != "OK" or not data:
                continue

            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email)

            # Extract and decode Subject
            subject, encoding = decode_header(msg["Subject"] or "")[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding or "utf-8", errors="ignore")

            # Extract and decode From sender
            from_sender, encoding = decode_header(msg["From"] or "")[0]
            if isinstance(from_sender, bytes):
                from_sender = from_sender.decode(encoding or "utf-8", errors="ignore")

            body = get_email_body(msg)

            unread_leads.append(
                {
                    "email_id": e_id.decode("utf-8"),
                    "sender": from_sender,
                    "subject": subject,
                    "body": body.strip(),
                }
            )

            # Optionally mark as read by adding Seen flag
            mail.store(e_id, "+FLAGS", "\\Seen")

        mail.logout()

    except Exception as e:
        logger.error(f"Error checking email via IMAP: {e}")

    return unread_leads
