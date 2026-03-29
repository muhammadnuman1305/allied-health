using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class TaskInterventionComponentConfig : IEntityTypeConfiguration<TaskInterventionComponent>
    {
        public void Configure(EntityTypeBuilder<TaskInterventionComponent> b)
        {
            b.ToTable("TaskInterventionComponent");

            b.HasKey(x => x.Id);

            b.Property(x => x.Value)
                .HasMaxLength(300)
                .IsRequired();

            b.HasOne(x => x.TaskIntervention)
                .WithMany(ti => ti.SelectedComponents)
                .HasForeignKey(x => x.TaskInterventionId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.ComponentType)
                .WithMany(ct => ct.TaskInterventionComponents)
                .HasForeignKey(x => x.ComponentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => x.TaskInterventionId);
            b.HasIndex(x => x.ComponentTypeId);
        }
    }
}
