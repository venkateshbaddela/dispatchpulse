from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Organization, User
# Register your models here.

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    search_fields = ('name', 'slug')
    readonly_fields = ('id', 'created_at')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'organization', 'role', 'is_on_call', 'is_staff')
    list_filter = ('role', 'is_on_call', 'is_staff', 'organization')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('DispatchPulse Profile', {
            'fields': ('organization', 'role', 'is_on_call')
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('DispatchPulse Profile', {
            'fields': ('email', 'organization', 'role', 'is_on_call')
        }),
    )