from rest_framework.pagination import PageNumberPagination # pyright: ignore[reportMissingImports]
from rest_framework.response import Response # pyright: ignore[reportMissingImports]

class ItemPaginationFep(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size_fep'
    max_page_size = 100
    
    def get_paginated_response(self, data_fep):
        return Response({
            'count_fep': self.page.paginator.count,
            'next_fep': self.get_next_link(),
            'previous_fep': self.get_previous_link(),
            'page_fep': self.page.number,
            'page_size_fep': self.get_page_size(self.request),
            'total_pages_fep': self.page.paginator.num_pages,
            'results_fep': data_fep
        })

class CursorItemPaginationFep(PageNumberPagination):
    page_size = 20
    cursor_query_param = 'cursor_fep'
    ordering = '-created_at_fep'
    
    def get_paginated_response(self, data_fep):
        return Response({
            'next_fep': self.get_next_link(),
            'previous_fep': self.get_previous_link(),
            'results_fep': data_fep
        })