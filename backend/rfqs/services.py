
from datetime import timedelta
from django.utils import timezone


def get_rfq_status(rfq, today=None):
    if today is None:
        today = timezone.localdate()

    if rfq.needed_by < today:
        return "Expired"

    quotes = list(rfq.quotes.all())

    if not quotes:
        return "Open"

    for quote in quotes:
        if quote.valid_until >= today:
            return "Quoted"

    return "Expired"


def get_best_quote(rfq, today=None):
    if today is None:
        today = timezone.localdate()

    eligible_quotes = []

    for quote in rfq.quotes.all():

        if quote.valid_until < today:
            continue

        arrival_date = today + timedelta(
            days=quote.lead_time_days
        )

        if arrival_date > rfq.needed_by:
            continue

        eligible_quotes.append(quote)

    if not eligible_quotes:
        return None

    return min(
        eligible_quotes,
        key=lambda quote: quote.unit_price
    )
