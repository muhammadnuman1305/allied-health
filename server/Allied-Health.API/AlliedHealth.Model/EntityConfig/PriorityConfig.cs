using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Model.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class PriorityConfig : IEntityTypeConfiguration<Priority>
    {
        public void Configure(EntityTypeBuilder<Priority> b)
        {
            b.ToTable("Priority");

            b.HasKey(x => x.Id);

            b.Property(x => x.Name)
                .HasMaxLength(250)
                .IsRequired();

            b.HasIndex(x => x.Name).IsUnique();
        }
    }
}