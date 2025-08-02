"""Fix enum formats from underscore to space-separated

Revision ID: fix_enum_formats
Revises: add_plant_owner_role
Create Date: 2025-08-02 12:15:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_enum_formats'
down_revision = 'add_plant_owner_role'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Convert underscore-based enums to space-separated format"""
    
    # 1. Update plant data to use temporary values
    op.execute("""
        UPDATE plants 
        SET status = CASE status
            WHEN 'IN_OPERATION' THEN 'TEMP_IN_OPERATION'
            WHEN 'IN_AUTHORIZATION' THEN 'TEMP_IN_AUTHORIZATION'
            WHEN 'UNDER_CONSTRUCTION' THEN 'TEMP_UNDER_CONSTRUCTION'
            WHEN 'DECOMMISSIONED' THEN 'TEMP_DECOMMISSIONED'
            ELSE status
        END,
        type = CASE type
            WHEN 'PHOTOVOLTAIC' THEN 'TEMP_PHOTOVOLTAIC'
            WHEN 'WIND' THEN 'TEMP_WIND'
            WHEN 'HYDROELECTRIC' THEN 'TEMP_HYDROELECTRIC'
            WHEN 'BIOMASS' THEN 'TEMP_BIOMASS'
            WHEN 'GEOTHERMAL' THEN 'TEMP_GEOTHERMAL'
            ELSE type
        END
    """)
    
    # 2. Create new enum types with correct values
    op.execute("CREATE TYPE plantstatusenum_new AS ENUM ('In Operation', 'In Authorization', 'Under Construction', 'Decommissioned')")
    op.execute("CREATE TYPE planttypeenum_new AS ENUM ('Photovoltaic', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal')")
    
    # 3. Add temporary columns
    op.add_column('plants', sa.Column('status_new', postgresql.ENUM('In Operation', 'In Authorization', 'Under Construction', 'Decommissioned', name='plantstatusenum_new'), nullable=True))
    op.add_column('plants', sa.Column('type_new', postgresql.ENUM('Photovoltaic', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal', name='planttypeenum_new'), nullable=True))
    
    # 4. Update temporary columns with correct values
    op.execute("""
        UPDATE plants 
        SET status_new = CASE status
            WHEN 'TEMP_IN_OPERATION' THEN 'In Operation'::plantstatusenum_new
            WHEN 'TEMP_IN_AUTHORIZATION' THEN 'In Authorization'::plantstatusenum_new
            WHEN 'TEMP_UNDER_CONSTRUCTION' THEN 'Under Construction'::plantstatusenum_new
            WHEN 'TEMP_DECOMMISSIONED' THEN 'Decommissioned'::plantstatusenum_new
            WHEN 'In Operation' THEN 'In Operation'::plantstatusenum_new
            WHEN 'In Authorization' THEN 'In Authorization'::plantstatusenum_new
            WHEN 'Under Construction' THEN 'Under Construction'::plantstatusenum_new
            WHEN 'Decommissioned' THEN 'Decommissioned'::plantstatusenum_new
        END,
        type_new = CASE type
            WHEN 'TEMP_PHOTOVOLTAIC' THEN 'Photovoltaic'::planttypeenum_new
            WHEN 'TEMP_WIND' THEN 'Wind'::planttypeenum_new
            WHEN 'TEMP_HYDROELECTRIC' THEN 'Hydroelectric'::planttypeenum_new
            WHEN 'TEMP_BIOMASS' THEN 'Biomass'::planttypeenum_new
            WHEN 'TEMP_GEOTHERMAL' THEN 'Geothermal'::planttypeenum_new
            WHEN 'Photovoltaic' THEN 'Photovoltaic'::planttypeenum_new
            WHEN 'Wind' THEN 'Wind'::planttypeenum_new
            WHEN 'Hydroelectric' THEN 'Hydroelectric'::planttypeenum_new
            WHEN 'Biomass' THEN 'Biomass'::planttypeenum_new
            WHEN 'Geothermal' THEN 'Geothermal'::planttypeenum_new
        END
    """)
    
    # 5. Drop old columns
    op.drop_column('plants', 'status')
    op.drop_column('plants', 'type')
    
    # 6. Rename new columns to original names
    op.alter_column('plants', 'status_new', new_column_name='status')
    op.alter_column('plants', 'type_new', new_column_name='type')
    
    # 7. Make columns not nullable
    op.alter_column('plants', 'status', nullable=False)
    op.alter_column('plants', 'type', nullable=False)
    
    # 8. Drop old enum types
    op.execute("DROP TYPE IF EXISTS plantstatusenum")
    op.execute("DROP TYPE IF EXISTS planttypeenum")
    
    # 9. Rename new enum types to original names
    op.execute("ALTER TYPE plantstatusenum_new RENAME TO plantstatusenum")
    op.execute("ALTER TYPE planttypeenum_new RENAME TO planttypeenum")
    
    # 10. Update any other tables that might use these enums
    # (Add similar updates for workflow_templates, etc. if needed)


def downgrade() -> None:
    """Revert to underscore-based enums"""
    
    # This is a complex operation - similar steps in reverse
    # 1. Create old enum types
    op.execute("CREATE TYPE plantstatusenum_old AS ENUM ('IN_OPERATION', 'IN_AUTHORIZATION', 'UNDER_CONSTRUCTION', 'DECOMMISSIONED')")
    op.execute("CREATE TYPE planttypeenum_old AS ENUM ('PHOTOVOLTAIC', 'WIND', 'HYDROELECTRIC', 'BIOMASS', 'GEOTHERMAL')")
    
    # 2. Add temporary columns
    op.add_column('plants', sa.Column('status_old', postgresql.ENUM('IN_OPERATION', 'IN_AUTHORIZATION', 'UNDER_CONSTRUCTION', 'DECOMMISSIONED', name='plantstatusenum_old'), nullable=True))
    op.add_column('plants', sa.Column('type_old', postgresql.ENUM('PHOTOVOLTAIC', 'WIND', 'HYDROELECTRIC', 'BIOMASS', 'GEOTHERMAL', name='planttypeenum_old'), nullable=True))
    
    # 3. Update with old values
    op.execute("""
        UPDATE plants 
        SET status_old = CASE status
            WHEN 'In Operation' THEN 'IN_OPERATION'::plantstatusenum_old
            WHEN 'In Authorization' THEN 'IN_AUTHORIZATION'::plantstatusenum_old
            WHEN 'Under Construction' THEN 'UNDER_CONSTRUCTION'::plantstatusenum_old
            WHEN 'Decommissioned' THEN 'DECOMMISSIONED'::plantstatusenum_old
        END,
        type_old = CASE type
            WHEN 'Photovoltaic' THEN 'PHOTOVOLTAIC'::planttypeenum_old
            WHEN 'Wind' THEN 'WIND'::planttypeenum_old
            WHEN 'Hydroelectric' THEN 'HYDROELECTRIC'::planttypeenum_old
            WHEN 'Biomass' THEN 'BIOMASS'::planttypeenum_old
            WHEN 'Geothermal' THEN 'GEOTHERMAL'::planttypeenum_old
        END
    """)
    
    # 4. Drop new columns
    op.drop_column('plants', 'status')
    op.drop_column('plants', 'type')
    
    # 5. Rename old columns
    op.alter_column('plants', 'status_old', new_column_name='status')
    op.alter_column('plants', 'type_old', new_column_name='type')
    
    # 6. Make not nullable
    op.alter_column('plants', 'status', nullable=False)
    op.alter_column('plants', 'type', nullable=False)
    
    # 7. Drop new types
    op.execute("DROP TYPE IF EXISTS plantstatusenum")
    op.execute("DROP TYPE IF EXISTS planttypeenum")
    
    # 8. Rename old types
    op.execute("ALTER TYPE plantstatusenum_old RENAME TO plantstatusenum")
    op.execute("ALTER TYPE planttypeenum_old RENAME TO planttypeenum")