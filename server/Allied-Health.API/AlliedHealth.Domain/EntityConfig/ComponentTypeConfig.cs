using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class ComponentTypeConfig : IEntityTypeConfiguration<ComponentType>
    {
        public void Configure(EntityTypeBuilder<ComponentType> b)
        {
            b.ToTable("ComponentType");

            b.HasKey(x => x.Id);

            b.Property(x => x.Id)
                .ValueGeneratedOnAdd();

            b.Property(x => x.Name)
                .HasMaxLength(100)
                .IsRequired();

            b.HasIndex(x => x.Name).IsUnique();

            // Seed pre-defined component types
            b.HasData(
                new ComponentType { Id = 1, Name = "Technique" },
                new ComponentType { Id = 2, Name = "Activity" },
                new ComponentType { Id = 3, Name = "Equipment" },
                new ComponentType { Id = 4, Name = "Education" },
                new ComponentType { Id = 5, Name = "Environment" },
                new ComponentType { Id = 6, Name = "AssistanceLevel" },
                new ComponentType { Id = 7, Name = "Safety" }
            );
        }
    }
}
