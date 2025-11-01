using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlliedHealth.Service.DTOs
{
    public class GetPatientOptionsDTO
    {
        public int Id { get; set; }
        public required string Name { get; set; }
    }

    public class GetDeptOptionsDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
    }

    public class GetWardOptionsDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public List<Guid> Departments { get; set; } = new List<Guid>();
    }

    public class GetAHAOptionsDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public List<Guid> Specialties { get; set; } = new List<Guid>();
    }

    public class GetSpecialityOptionsDTO
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
    }

    public class GetInterventionOptionsDTO
    {
        public Guid Id { get; set; }
        public Guid SpecialtyId { get; set; }
        public required string Name { get; set; }
    }
}
