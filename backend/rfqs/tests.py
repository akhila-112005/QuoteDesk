
from datetime import date
from django.test import TestCase
from .models import RFQ, SupplierQuote
from .services import get_best_quote, get_rfq_status


class BestQuoteTests(TestCase):

    def setUp(self):
        self.today = date(2026, 11, 23)

        self.rfq = RFQ.objects.create(
            part_number="PART-1001",
            description="Test electronic component",
            quantity=100,
            needed_by=date(2026, 11, 30),
        )

        self.supplier_a = SupplierQuote.objects.create(
            rfq=self.rfq,
            supplier_name="Supplier A",
            unit_price=500,
            lead_time_days=3,
            valid_until=date(2026, 11, 28),
        )

        self.supplier_b = SupplierQuote.objects.create(
            rfq=self.rfq,
            supplier_name="Supplier B",
            unit_price=450,
            lead_time_days=10,
            valid_until=date(2026, 11, 29),
        )

    def test_best_quote_considers_delivery_date(self):
        best = get_best_quote(self.rfq, self.today)

        self.assertEqual(best, self.supplier_a)

    def test_cheapest_late_quote_is_not_selected(self):
        best = get_best_quote(self.rfq, self.today)

        self.assertNotEqual(best, self.supplier_b)

    def test_expired_quote_is_not_selected(self):
        self.supplier_a.valid_until = date(2026, 11, 20)
        self.supplier_a.save()

        self.supplier_b.valid_until = date(2026, 11, 21)
        self.supplier_b.save()

        best = get_best_quote(self.rfq, self.today)

        self.assertIsNone(best)

    def test_rfq_status_is_expired_when_needed_by_date_passes(self):
        self.assertEqual(
            get_rfq_status(self.rfq, date(2026, 12, 1)),
            "Expired",
        )

    def test_rfq_status_is_open_without_quotes(self):
        empty_rfq = RFQ.objects.create(
            part_number="PART-2001",
            description="Another component",
            quantity=50,
            needed_by=date(2026, 11, 30),
        )

        self.assertEqual(
            get_rfq_status(empty_rfq, self.today),
            "Open",
        )
