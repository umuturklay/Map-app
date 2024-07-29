using System.ComponentModel.DataAnnotations;

namespace BaşarsoftProje.Models
{
    public class Point
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public double X { get; set; }

        [Required]
        public double Y { get; set; }

        [Required]
        public string Name { get; set; }
    }
}
