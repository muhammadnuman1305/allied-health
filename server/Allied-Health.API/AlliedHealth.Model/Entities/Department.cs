using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlliedHealth.Domain.Entities
{
    public class Department
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public int SpecialtyId { get; set; }
        public string Description { get; set; }

        // Staff & Settings
        public Guid DeptHead { get; set; } // User - AHP
        public int DefaultTaskPriority { get; set; }
        public string ContactNumber { get; set; }
        public string EmailAddress { get; set; }
        public string AdditionalNotes { get; set; }
    }
}
