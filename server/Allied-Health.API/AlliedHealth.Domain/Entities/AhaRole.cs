namespace AlliedHealth.Domain.Entities
{
    public class AhaRole
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = default!;            // varchar(250)

        public ICollection<AhaRoleCategory> Categories { get; set; } = new List<AhaRoleCategory>();
    }
}
