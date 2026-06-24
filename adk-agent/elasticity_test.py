# Copyright 2026 Google LLC
import random
import uuid
from locust import HttpUser, task, between

class ProductionAgentUser(HttpUser):
    """Elasticity test user for the Production ADK Agent."""

    wait_time = between(1, 3)  # Faster requests to trigger scaling

    def on_start(self):
        """Set up user session when starting."""
        self.user_id = f"user_{uuid.uuid4()}"
        self.session_id = f"session_{uuid.uuid4()}"

        # Create session for the Gemma agent using proper ADK API format
        session_data = {"state": {"user_type": "elasticity_test_user"}}

        self.client.post(
            f"/apps/production_agent/users/{self.user_id}/sessions/{self.session_id}",
            headers={"Content-Type": "application/json"},
            json=session_data,
        )

    @task(4)
    def test_conversations(self):
        """Test conversational capabilities - high frequency."""
        topics = [
            "How do I qualify a WhatsApp lead with budget details?",
            "Can you parse client requirements from a formal email?",
            "What is the average transaction price for a villa in Dubai Hills?",
            "How can I set up email IMAP authentication settings?",
            "How do I assign a broker to an urgent property lead?",
            "Can you extract pricing information from Property Finder inquiries?"
        ]

        # Use proper ADK API format for sending messages
        message_data = {
            "app_name": "production_agent",
            "user_id": self.user_id,
            "session_id": self.session_id,
            "new_message": {
                "role": "user",
                "parts": [{
                    "text": random.choice(topics)
                }]
            }
        }

        self.client.post(
            "/run",
            headers={"Content-Type": "application/json"},
            json=message_data,
        )

    @task(1)
    def health_check(self):
        """Test the health endpoint."""
        self.client.get("/health")
