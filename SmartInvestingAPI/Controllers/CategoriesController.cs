using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Repositories;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository categoryRepository;
        private readonly IMapper mapper;

        public CategoriesController(ICategoryRepository categoryRepository, IMapper mapper)
        {
            this.categoryRepository = categoryRepository;
            this.mapper = mapper;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await categoryRepository.GetAllAsync();
            return Ok(mapper.Map<List<CategoryDto>>(categories));
        }

        // GET: api/categories/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var category = await categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound();

            return Ok(mapper.Map<CategoryDto>(category));
        }
    }
}
