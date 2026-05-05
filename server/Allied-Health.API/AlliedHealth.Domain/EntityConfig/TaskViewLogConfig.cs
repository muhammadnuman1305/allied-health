using AlliedHealth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Task = AlliedHealth.Domain.Entities.Task;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class TaskViewLogConfig : IEntityTypeConfiguration<TaskViewLog>
    {
        public void Configure(EntityTypeBuilder<TaskViewLog> b)
        {
            b.ToTable("TaskViewLog");

            b.HasKey(t => t.Id);

            b.Property(t => t.ViewedAt).IsRequired();

            b.HasOne(t => t.Task)
             .WithMany(t => t.ViewLogs)
             .HasForeignKey(t => t.TaskId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(t => t.AhaUser)
             .WithMany()
             .HasForeignKey(t => t.AhaUserId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(t => new { t.TaskId, t.ViewedAt });
            b.HasIndex(t => t.AhaUserId);
        }
    }
}
