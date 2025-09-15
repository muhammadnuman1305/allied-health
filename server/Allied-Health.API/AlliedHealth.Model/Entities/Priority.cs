using AlliedHealth.Domain.EntityConfigs;

namespace AlliedHealth.Model.Entities
{
    public class Priority
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = default!;            // varchar(250)

        public ICollection<Patient> Patients { get; set; } = new List<Patient>();
    }
}
