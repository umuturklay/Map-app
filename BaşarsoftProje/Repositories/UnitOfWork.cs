using BaşarsoftProje.Data;
using BaşarsoftProje.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BaşarsoftProje.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly PointContext _context;
        private Repository<Point> _points;

        public UnitOfWork(PointContext context)
        {
            _context = context;
        }

        public IRepository<Point> Points => _points ??= new Repository<Point>(_context);

        public async Task<int> CommitAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
