
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from .models import RFQ, SupplierQuote
from .serializers import RFQSerializer, SupplierQuoteSerializer


class RFQViewSet(viewsets.ModelViewSet):
    queryset = RFQ.objects.all().order_by("-created_at")
    serializer_class = RFQSerializer


class SupplierQuoteViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierQuoteSerializer

    def get_queryset(self):
        return SupplierQuote.objects.filter(
            rfq_id=self.kwargs["rfq_id"]
        ).order_by("unit_price")

    def perform_create(self, serializer):
        rfq = get_object_or_404(
            RFQ,
            id=self.kwargs["rfq_id"]
        )
        serializer.save(rfq=rfq)

    def perform_update(self, serializer):
        serializer.save()
