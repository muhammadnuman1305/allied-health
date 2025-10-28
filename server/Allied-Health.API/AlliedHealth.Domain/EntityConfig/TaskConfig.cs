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

            // Primary Key
            b.HasKey(t => t.Id);

            // Properties
            b.Property(t => t.Type)
                .IsRequired();

            b.Property(t => t.CustomType)
                .HasMaxLength(150)
                .IsRequired(false);

            b.Property(t => t.Title)
                .HasMaxLength(250)
                .IsRequired();

            b.Property(t => t.Description)
                .HasMaxLength(500)
                .IsRequired(false);

            b.Property(t => t.Priority)
                .IsRequired();

            b.Property(t => t.DueDate)
                .HasColumnType("date")
                .IsRequired();

            b.Property(t => t.DueTime)
                .HasColumnType("time")
                .IsRequired();

            b.Property(t => t.Status)
                .IsRequired();

            // Relationships
            b.HasOne(t => t.Patient)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Navigation
            b.HasMany(t => t.TaskInterventions)
                .WithOne(ti => ti.Task)
                .HasForeignKey(ti => ti.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
