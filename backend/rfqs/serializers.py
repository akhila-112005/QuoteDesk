
from rest_framework import serializers
from .models import RFQ, SupplierQuote
from .services import get_rfq_status, get_best_quote


class SupplierQuoteSerializer(serializers.ModelSerializer):

    class Meta:
        model = SupplierQuote
        fields = [
            "id",
            "supplier_name",
            "unit_price",
            "lead_time_days",
            "valid_until",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class RFQSerializer(serializers.ModelSerializer):
    quotes = SupplierQuoteSerializer(many=True, read_only=True)
    status = serializers.SerializerMethodField()
    best_quote = serializers.SerializerMethodField()

    class Meta:
        model = RFQ
        fields = [
            "id",
            "part_number",
            "description",
            "quantity",
            "needed_by",
            "created_at",
            "quotes",
            "status",
            "best_quote",
        ]
        read_only_fields = ["id", "created_at"]

    def get_status(self, obj):
        return get_rfq_status(obj)

    def get_best_quote(self, obj):
        quote = get_best_quote(obj)

        if quote is None:
            return None

        return SupplierQuoteSerializer(quote).data
