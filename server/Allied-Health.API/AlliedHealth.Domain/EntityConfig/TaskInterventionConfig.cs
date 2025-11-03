using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class TaskInterventionConfig : IEntityTypeConfiguration<TaskIntervention>
    {
        public void Configure(EntityTypeBuilder<TaskIntervention> b)
        {
            b.ToTable("TaskIntervention");

            // Primary Key
            b.HasKey(x => x.Id);

            // Properties
            b.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            b.Property(x => x.TaskId)
                .IsRequired();

            b.Property(x => x.InterventionId)
                .IsRequired();

            b.Property(x => x.AhaId)
                .IsRequired();

            b.Property(x => x.WardId)
                .IsRequired();

            b.Property(x => x.StartDate)
                .HasColumnType("date")
                .IsRequired();

            b.Property(x => x.EndDate)
                .HasColumnType("date")
                .IsRequired();

            b.Property(x => x.OutcomeStatus)
                .IsRequired();

            b.Property(x => x.Outcome);

            b.Property(x => x.OutcomeDate)
                .HasColumnType("date");

            // Relationships
            b.HasOne(x => x.Task)
                .WithMany(t => t.TaskInterventions)
                .HasForeignKey(x => x.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Intervention)
                .WithMany(i => i.TaskInterventions)
                .HasForeignKey(x => x.InterventionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
