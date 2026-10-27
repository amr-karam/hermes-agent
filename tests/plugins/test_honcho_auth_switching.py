"""Regression tests for honcho auth-switching credential staleness (#76399, #76400).

When a user switches deployment mode in ``hermes honcho setup``, credentials
from the previous mode must be purged so they can't leak into the new mode:

- Cloud -> local: stale cloud API key / OAuth grant removed from host block
- Local -> cloud: stale local JWT removed from host block
- Blank local JWT: existing local JWT kept (not a bug, but locked in)

These tests drive ``_setup_local_auth`` and ``_setup_cloud_auth`` directly
with a monkeypatched ``_prompt`` and a plain dict as ``hermes_host``.
"""

import pytest

import plugins.memory.honcho.cli as honcho_cli


def _fake_prompt(responses: dict[str, str]):
    """Return a _prompt stand-in that answers by matching on label substring."""

    def _prompt(label: str, default: str | None = None, secret: bool = False) -> str:
        for needle, answer in responses.items():
            if needle.lower() in label.lower():
                return answer
        return default or ""

    return _prompt


class TestCloudToLocalClearsStaleCloudCreds:
    """Switching from cloud to local removes cloud apiKey/oauth from host block."""

    def test_clears_api_key_and_oauth_when_no_prior_base_url(self, monkeypatch):
        monkeypatch.setattr(honcho_cli, "_prompt", _fake_prompt({"base url": "http://localhost:8000"}))
        cfg = {}  # no baseUrl -> cloud was previously active
        hermes_host = {"apiKey": "cloud-api-key", "oauth": {"accessToken": "tok", "refreshToken": "rt"}}

        honcho_cli._setup_local_auth(cfg, hermes_host)

        assert "apiKey" not in hermes_host
        assert "oauth" not in hermes_host
        assert cfg.get("baseUrl") == "http://localhost:8000"

    def test_keeps_local_jwt_when_prior_base_url_existed(self, monkeypatch):
        monkeypatch.setattr(honcho_cli, "_prompt", _fake_prompt({"base url": ""}))
        cfg = {"baseUrl": "http://localhost:8000"}  # local was previously active
        hermes_host = {"apiKey": "existing-local-jwt"}

        honcho_cli._setup_local_auth(cfg, hermes_host)

        # baseUrl existed, so no purge; blank input keeps current JWT
        assert hermes_host.get("apiKey") == "existing-local-jwt"

    def test_sets_new_local_jwt_when_provided(self, monkeypatch):
        monkeypatch.setattr(honcho_cli, "_prompt", _fake_prompt({"base url": "", "jwt": "new-local-jwt"}))
        cfg = {}  # cloud was active -> purge first
        hermes_host = {"apiKey": "stale-cloud-key", "oauth": {"accessToken": "tok"}}

        honcho_cli._setup_local_auth(cfg, hermes_host)

        assert "oauth" not in hermes_host
        assert hermes_host.get("apiKey") == "new-local-jwt"


class TestLocalToCloudClearsStaleLocalJwt:
    """Switching from local to cloud removes local apiKey (JWT) from host block."""

    def test_clears_local_jwt_when_prior_base_url_existed(self, monkeypatch):
        monkeypatch.setattr(honcho_cli, "_prompt", _fake_prompt({"api key": "cloud-api-key"}))
        cfg = {"baseUrl": "http://localhost:8000"}  # local was active
        hermes_host = {"apiKey": "stale-local-jwt"}

        honcho_cli._setup_cloud_auth(cfg, hermes_host, write_path=None)

        assert "apiKey" not in hermes_host
        assert cfg.get("baseUrl") is None  # baseUrl popped for cloud

    def test_does_not_purge_when_no_prior_base_url(self, monkeypatch):
        monkeypatch.setattr(honcho_cli, "_prompt", _fake_prompt({"api key": "cloud-api-key"}))
        cfg = {}  # no baseUrl -> cloud was already active
        hermes_host = {"apiKey": "existing-cloud-key"}

        honcho_cli._setup_cloud_auth(cfg, hermes_host, write_path=None)

        # No prior baseUrl, so nothing to purge; existing cloud key kept
        assert hermes_host.get("apiKey") == "existing-cloud-key"


class TestBlankLocalJwtKeepsCurrent:
    """Blank local JWT input keeps the existing JWT (existing behavior, locked in)."""

    def test_keeps_existing_jwt_on_blank_input(self, monkeypatch):
        monkeypatch.setattr(honcho_cli, "_prompt", _fake_prompt({"base url": "", "jwt": ""}))
        cfg = {"baseUrl": "http://localhost:8000"}
        hermes_host = {"apiKey": "current-local-jwt"}

        honcho_cli._setup_local_auth(cfg, hermes_host)

        assert hermes_host.get("apiKey") == "current-local-jwt"

    def test_replaces_jwt_on_non_blank_input(self, monkeypatch):
        monkeypatch.setattr(honcho_cli, "_prompt", _fake_prompt({"base url": "", "jwt": "replacement-jwt"}))
        cfg = {"baseUrl": "http://localhost:8000"}
        hermes_host = {"apiKey": "old-local-jwt"}

        honcho_cli._setup_local_auth(cfg, hermes_host)

        assert hermes_host.get("apiKey") == "replacement-jwt"
