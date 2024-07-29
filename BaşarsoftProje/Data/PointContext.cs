using BaşarsoftProje.Models;
using Microsoft.EntityFrameworkCore;

namespace BaşarsoftProje.Data
{
    public class PointContext : DbContext
    {
        public PointContext(DbContextOptions<PointContext> options) : base(options) { }

        public DbSet<Point> Points { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Point>()
                .Property(p => p.X)
                .HasColumnType("double precision");

            modelBuilder.Entity<Point>()
                .Property(p => p.Y)
                .HasColumnType("double precision");
        }
    }
}