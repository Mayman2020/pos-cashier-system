package com.poscashier.modules.category.service;

import com.poscashier.modules.category.dto.CategoryRequest;
import com.poscashier.modules.category.dto.CategoryResponse;
import com.poscashier.modules.category.entity.Category;
import com.poscashier.modules.category.repository.CategoryRepository;
import com.poscashier.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<CategoryResponse> list(String q, Pageable pageable) {
        String query = q == null ? null : q.trim();
        if (query == null || query.isEmpty()) {
            return categoryRepository.findAllByOrderBySortOrderAscNameAsc(pageable).map(CategoryResponse::from);
        }
        return categoryRepository.search(query, pageable).map(CategoryResponse::from);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return CategoryResponse.from(findEntity(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .active(request.getActive() == null || request.getActive())
                .build();
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findEntity(id);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setColor(request.getColor());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        categoryRepository.delete(findEntity(id));
    }

    public Category findEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Category not found"));
    }
}
