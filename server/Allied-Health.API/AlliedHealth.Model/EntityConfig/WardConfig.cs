using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Model.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class WardConfig : IEntityTypeConfiguration<Ward>
    {
        public void Configure(EntityTypeBuilder<Ward> b)
        {
            b.ToTable("Ward");

            b.HasKey(x => x.Id);

            b.Property(x => x.Name)
                .HasMaxLength(250)
                .IsRequired();

            b.HasIndex(x => x.Name).IsUnique();
        }
    }
}
