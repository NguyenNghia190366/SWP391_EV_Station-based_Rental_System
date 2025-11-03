using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.FeeType
{
    public class FeeTypeCreateDto
    {
        [Required]
        public string FeeType { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }
    }
}