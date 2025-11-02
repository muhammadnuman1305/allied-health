// EntityConfigs/TaskConfig.cs
using AlliedHealth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Task = AlliedHealth.Domain.Entities.Task;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class TaskConfig : IEntityTypeConfiguration<Task>
    {
        public void Configure(EntityTypeBuilder<Task> b)
        {
            b.ToTable("Task");

            // PK
            b.HasKey(t => t.Id);

            // Columns
            b.Property(t => t.Title).HasMaxLength(250).IsRequired();
            b.Property(t => t.Diagnosis).HasMaxLength(250);
            b.Property(t => t.Description).HasMaxLength(500);
            b.Property(t => t.Goals).HasMaxLength(500);

            b.Property(t => t.Priority).IsRequired();
            b.Property(t => t.Status).IsRequired();

            b.Property(t => t.StartDate).HasColumnType("date").IsRequired();
            b.Property(t => t.EndDate).HasColumnType("date").IsRequired();

            // Auditing & flags
            b.Property(t => t.CreatedDate).HasDefaultValueSql("timezone('utc', now())");
            b.Property(t => t.ModifiedDate).HasDefaultValueSql("timezone('utc', now())");
            b.Property(t => t.Hidden).HasDefaultValue(false).IsRequired();

            // Relationships
            b.HasOne(t => t.Patient)
             .WithMany(p => p.Tasks)
             .HasForeignKey(t => t.PatientId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(t => t.Department)
             .WithMany()
             .HasForeignKey(t => t.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(t => t.Referral)
             .WithMany(r => r.Tasks)
             .HasForeignKey(t => t.ReferralId)
             .OnDelete(DeleteBehavior.SetNull);

            b.HasMany(t => t.TaskInterventions)
             .WithOne(ti => ti.Task)
             .HasForeignKey(ti => ti.TaskId)
             .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            b.HasIndex(t => new { t.DepartmentId, t.Status, t.Priority });
            b.HasIndex(t => new { t.PatientId, t.StartDate, t.EndDate });
            b.HasIndex(t => t.ReferralId);
            b.HasIndex(t => t.Hidden);
        }
    }
}