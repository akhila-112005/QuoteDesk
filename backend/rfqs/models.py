
from django.db import models


class RFQ(models.Model):
    part_number = models.CharField(max_length=100)
    description = models.TextField()
    quantity = models.PositiveIntegerField()
    needed_by = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.part_number


class SupplierQuote(models.Model):
    rfq = models.ForeignKey(
        RFQ,
        on_delete=models.CASCADE,
        related_name="quotes"
    )
    supplier_name = models.CharField(max_length=150)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    lead_time_days = models.PositiveIntegerField()
    valid_until = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.supplier_name} - {self.rfq.part_number}"
