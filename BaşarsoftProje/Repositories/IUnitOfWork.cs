using System;
using System.Threading.Tasks;
using BaşarsoftProje.Models;

namespace BaşarsoftProje.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Point> Points { get; }
        Task<int> CommitAsync();
    }
}
