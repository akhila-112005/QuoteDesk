
from django.contrib import admin
from .models import RFQ, SupplierQuote


class SupplierQuoteInline(admin.TabularInline):
    model = SupplierQuote
    extra = 0


@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
    list_display = (
        "part_number",
        "quantity",
        "needed_by",
        "created_at",
    )
    search_fields = ("part_number", "description")
    inlines = [SupplierQuoteInline]


@admin.register(SupplierQuote)
class SupplierQuoteAdmin(admin.ModelAdmin):
    list_display = (
        "supplier_name",
        "rfq",
        "unit_price",
        "lead_time_days",
        "valid_until",
    )
    search_fields = ("supplier_name", "rfq__part_number")
