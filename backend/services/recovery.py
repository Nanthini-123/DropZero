RISK_ORDER = {
    "Low": 0,
    "Medium": 1,
    "High": 2,
}


def compare_predictions(
    previous_risk: str,
    current_risk: str,
) -> str:
    """
    Compare two real model predictions.

    Lower risk = Recovered
    Same risk = Unchanged
    Higher risk = Escalated
    """

    previous = RISK_ORDER[previous_risk]
    current = RISK_ORDER[current_risk]

    if current < previous:
        return "Recovered"

    if current > previous:
        return "Escalated"

    return "Unchanged"