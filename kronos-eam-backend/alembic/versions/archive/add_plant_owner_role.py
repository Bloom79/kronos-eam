"""Add Plant Owner role to userroleenum

Revision ID: add_plant_owner_role
Revises: f2d81f9341a6
Create Date: 2025-08-02 12:00:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_plant_owner_role'
down_revision = 'f2d81f9341a6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add Plant Owner to userroleenum"""
    # PostgreSQL requires special handling for enum modifications
    # We need to use ALTER TYPE to add a new value
    op.execute("ALTER TYPE userroleenum ADD VALUE IF NOT EXISTS 'Plant Owner' AFTER 'Asset Manager'")
    
    # Note: PostgreSQL doesn't allow removing enum values in a transaction
    # So downgrade will be limited


def downgrade() -> None:
    """Remove Plant Owner from userroleenum - Limited functionality"""
    # PostgreSQL doesn't support removing enum values easily
    # We'll update any existing Plant Owner users to Asset Manager
    op.execute("""
        UPDATE users 
        SET role = 'Asset Manager' 
        WHERE role = 'Plant Owner'
    """)
    
    # Note: The enum value 'Plant Owner' will remain in the type definition
    # This is a PostgreSQL limitation - enum values cannot be dropped