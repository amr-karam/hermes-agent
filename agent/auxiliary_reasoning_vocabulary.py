"""Reasoning vocabulary for auxiliary LLM providers.

Defines declared reasoning efforts that auxiliary providers can support.
Used by `agent.auxiliary_client` to validate and map reasoning effort values.
"""


# Maps reasoning effort names to their integer priority values.
# Lower values = lower priority / cheaper to compute.
# This vocabulary is authoritative for what auxiliary providers declare.
declared_reasoning_efforts: dict[str, int] = {
    "none": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
    "auto": 4,
}