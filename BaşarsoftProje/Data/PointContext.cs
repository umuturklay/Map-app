using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace BaşarsoftProje.Data
{
    public class PointContext : DbContext
    {
        public PointContext(DbContextOptions<PointContext> options) : base(options) { }

        public DbSet<Point> Points { get; set; }
    }
}

