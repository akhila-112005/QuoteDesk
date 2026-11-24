
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RFQViewSet, SupplierQuoteViewSet

router = DefaultRouter()
router.register("rfqs", RFQViewSet, basename="rfq")

urlpatterns = [
    path("", include(router.urls)),

    path(
        "rfqs/<int:rfq_id>/quotes/",
        SupplierQuoteViewSet.as_view({
            "get": "list",
            "post": "create",
        }),
        name="rfq-quotes",
    ),

    path(
        "rfqs/<int:rfq_id>/quotes/<int:pk>/",
        SupplierQuoteViewSet.as_view({
            "get": "retrieve",
            "put": "update",
            "patch": "partial_update",
            "delete": "destroy",
        }),
        name="rfq-quote-detail",
    ),
]
