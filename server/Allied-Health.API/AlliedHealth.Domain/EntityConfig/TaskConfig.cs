using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;
using Task = AlliedHealth.Domain.Entities.Task;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class TaskConfig : IEntityTypeConfiguration<Task>
    {
        public void Configure(EntityTypeBuilder<Task> b)
        {
            b.ToTable("Task");

            // Primary Key
            b.HasKey(t => t.Id);

            // Property Configurations
            b.Property(t => t.Title)
                .HasMaxLength(250)
                .IsRequired();

            b.Property(t => t.Description)
                .HasMaxLength(500)
                .IsRequired(false);

            b.Property(t => t.Priority)
                .IsRequired();

            b.Property(t => t.StartDate)
                .HasColumnType("date")
                .IsRequired();

            b.Property(t => t.EndDate)
                .HasColumnType("date")
                .IsRequired();

            b.Property(t => t.Status)
                .IsRequired();

            // Auditing Fields
            b.Property(t => t.CreatedDate)
                .HasDefaultValueSql("timezone('utc', now())");

            b.Property(t => t.CreatedBy)
                .IsRequired(false);

            b.Property(t => t.ModifiedDate)
                .HasDefaultValueSql("timezone('utc', now())");

            b.Property(t => t.ModifiedBy)
                .IsRequired(false);

            b.Property(t => t.Hidden)
                .HasDefaultValue(false)
                .IsRequired();

            // Relationships
            b.HasOne(t => t.Patient)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(t => t.Department)
                .WithMany()
                .HasForeignKey(t => t.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasMany(t => t.TaskInterventions)
                .WithOne(ti => ti.Task)
                .HasForeignKey(ti => ti.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
