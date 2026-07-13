import sqlite3
import logging
from typing import Dict, Any, Optional
from app.core.database import connect_db

logger = logging.getLogger(__name__)


def save_user_integrations(user_id: int, data: Dict[str, Any]) -> bool:
    """
    Saves or updates integration credentials for a specific user ID.
    """
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Check if integrations already exist for this user
        cursor.execute("SELECT id FROM user_integrations WHERE user_id = ?", (user_id,))
        exists = cursor.fetchone()

        if exists:
            # Update existing
            cursor.execute(
                """
                UPDATE user_integrations
                SET whatsapp_phone_number_id = ?,
                    whatsapp_access_token = ?,
                    whatsapp_verify_token = ?,
                    imap_host = ?,
                    imap_port = ?,
                    imap_user = ?,
                    imap_password = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """,
                (
                    data.get("whatsapp_phone_number_id"),
                    data.get("whatsapp_access_token"),
                    data.get("whatsapp_verify_token"),
                    data.get("imap_host"),
                    data.get("imap_port", 993),
                    data.get("imap_user"),
                    data.get("imap_password"),
                    user_id,
                ),
            )
        else:
            # Insert new
            cursor.execute(
                """
                INSERT INTO user_integrations (
                    user_id, whatsapp_phone_number_id, whatsapp_access_token, whatsapp_verify_token,
                    imap_host, imap_port, imap_user, imap_password
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    user_id,
                    data.get("whatsapp_phone_number_id"),
                    data.get("whatsapp_access_token"),
                    data.get("whatsapp_verify_token"),
                    data.get("imap_host"),
                    data.get("imap_port", 993),
                    data.get("imap_user"),
                    data.get("imap_password"),
                ),
            )

        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error saving user integrations: {e}")
        return False


def get_user_integrations(user_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetches the integration settings/credentials for a specific user.
    """
    try:
        conn = connect_db()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT whatsapp_phone_number_id, whatsapp_access_token, whatsapp_verify_token,
                   imap_host, imap_port, imap_user, imap_password
            FROM user_integrations
            WHERE user_id = ?
        """,
            (user_id,),
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            return dict(row)
        return None
    except Exception as e:
        logger.error(f"Error retrieving user integrations: {e}")
        return None


def get_user_by_whatsapp_phone_id(phone_number_id: str) -> Optional[int]:
    """
    Looks up which user owns a particular WhatsApp Phone Number ID.
    Used to route incoming Meta webhooks to the correct tenant.
    """
    try:
        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT user_id FROM user_integrations
            WHERE whatsapp_phone_number_id = ?
        """,
            (phone_number_id,),
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            return row[0]
        return None
    except Exception as e:
        logger.error(f"Error mapping WhatsApp phone number to user: {e}")
        return None


def is_whatsapp_message_processed(message_id: str) -> bool:
    """
    Idempotency check: returns True if this WhatsApp message_id was
    already processed. Prevents duplicate lead qualification and replies
    when Meta retries webhook delivery after network glitches.
    """
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT 1 FROM processed_whatsapp_messages WHERE message_id = ?",
            (message_id,),
        )
        result = cursor.fetchone()
        conn.close()
        return result is not None
    except Exception as e:
        logger.error(f"Error checking idempotency for message {message_id}: {e}")
        return False


def mark_whatsapp_message_processed(message_id: str) -> None:
    """
    Records a WhatsApp message_id as processed so future duplicate
    webhook deliveries from Meta are safely ignored.
    """
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR IGNORE INTO processed_whatsapp_messages (message_id) VALUES (?)",
            (message_id,),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error marking message {message_id} as processed: {e}")


def flag_whatsapp_disconnected(user_id: int) -> None:
    """
    Token revocation handler: flags a user's WhatsApp integration as
    disconnected (e.g. when Meta returns 401 Unauthorized).
    The frontend will show 'Disconnected' status and prompt re-authentication.
    """
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE user_integrations
            SET whatsapp_disconnected = 1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            """,
            (user_id,),
        )
        conn.commit()
        conn.close()
        logger.warning(
            f"WhatsApp integration flagged as disconnected for user {user_id}"
        )
    except Exception as e:
        logger.error(f"Error flagging WhatsApp disconnected for user {user_id}: {e}")
