using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Model.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class TaskInterventionConfig : IEntityTypeConfiguration<TaskIntervention>
    {
        public void Configure(EntityTypeBuilder<TaskIntervention> b)
        {
            b.ToTable("TaskIntervention");

            b.HasKey(x => new { x.TaskId, x.InterventionId });

            b.HasOne(x => x.Task)
                .WithMany(t => t.TaskInterventions)
                .HasForeignKey(x => x.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Intervention)
                .WithMany(i => i.TaskInterventions)
                .HasForeignKey(x => x.InterventionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
