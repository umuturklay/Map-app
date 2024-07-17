using System.ComponentModel.DataAnnotations;

namespace BaşarsoftProje
{
    public class Point
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public int X { get; set; }

        [Required]
        public int Y { get; set; }

        [Required]
        public string Name { get; set; }
    }
}
