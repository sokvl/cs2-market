from django.urls import path, include # pyright: ignore[reportMissingModuleSource]
from rest_framework.routers import DefaultRouter # pyright: ignore[reportMissingImports]
from .views import ( # pyright: ignore[reportMissingImports]
    LoginViewAut,
    LogoutViewAut,
    TokenRefreshViewAut,
    UserProfileViewAut,
    ChangePasswordViewAut,
    UserSessionsViewAut,
    APITokensViewSetAut,
    SecurityEventsViewAut,
    AdminUsersViewSetAut,
    VerifyEmailViewAut,
    EnableMFAViewAut,
    SystemStatusViewAut,
    admin_dashboard_view_aut,
    delete_user_view_aut
)

router_aut = DefaultRouter()
router_aut.register(r'api-tokens', APITokensViewSetAut, basename='api-token')
router_aut.register(r'admin/users', AdminUsersViewSetAut, basename='admin-user')

urlpatterns_aut = [
    # Authentication
    path('login/', LoginViewAut.as_view(), name='login_aut'),
    path('logout/', LogoutViewAut.as_view(), name='logout_aut'),
    path('token/refresh/', TokenRefreshViewAut.as_view(), name='token_refresh_aut'),
    
    # User management
    path('profile/', UserProfileViewAut.as_view(), name='user_profile_aut'),
    path('change-password/', ChangePasswordViewAut.as_view(), name='change_password_aut'),
    path('sessions/', UserSessionsViewAut.as_view(), name='user_sessions_aut'),
    path('sessions/terminate/', UserSessionsViewAut.as_view({'post': 'terminate_aut'}), name='terminate_sessions_aut'),
    
    # Email verification and MFA
    path('verify-email/', VerifyEmailViewAut.as_view(), name='verify_email_aut'),
    path('enable-mfa/', EnableMFAViewAut.as_view(), name='enable_mfa_aut'),
    
    # Security
    path('security-events/', SecurityEventsViewAut.as_view(), name='security_events_aut'),
    
    # System
    path('system/status/', SystemStatusViewAut.as_view(), name='system_status_aut'),
    
    # Example views with decorators
    path('admin/dashboard/', admin_dashboard_view_aut, name='admin_dashboard_aut'),
    path('admin/delete-user/', delete_user_view_aut, name='delete_user_aut'),
    
    # Include router URLs
    path('', include(router_aut.urls)),
]