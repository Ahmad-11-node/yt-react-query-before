import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

function Products() {
  const [page, setPage] = useState(1);
  const limit = 4;

  // 🟢 Fetch categories (array of strings)
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("https://dummyjson.com/products/categories");
      return res.json();
    },
  });

  // 🟢 Fetch paginated products
  const { data, isLoading } = useQuery({
    queryKey: ["products", page],
    queryFn: async () => {
      const skip = (page - 1) * limit;
      const res = await fetch(
        `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
      );
      return res.json(); // 👈 return full object (includes total + products)
    },
  placeholderData : keepPreviousData,
  });

  if (isLoading) return <p>Loading...</p>;

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            My store
          </h2>
        </div>

        {/* Search and category filter */}
        <div className="relative mt-2 rounded-md flex items-center gap-8 mb-4">
          <input
            onChange={() => {}}
            type="text"
            placeholder="Search product..."
            className="block w-full rounded-md border py-1.5 px-3 text-gray-900 ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
          />
          <select className="border p-2">
            <option>Select category</option>
            {categories?.map((category) => (
  <option key={category.slug} value={category.slug}>
    {category.name}
  </option>
))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {data.products.map((product) => (
            <div key={product.id} className="group relative border p-2 rounded">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-64">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700 font-semibold">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.category}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;
