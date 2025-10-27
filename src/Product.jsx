import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";

const Product = () => {

   const params = useParams();
   const productId = params.productId; 
   
   //mutaion

     const mutation = useMutation({
    mutationFn: (newProduct) => {
      return axios.put(`https://dummyjson.com/products/${productId}`, newProduct)
    },
  })
   

    const fetchProduct = async() => {
        const response = await fetch(`https://dummyjson.com/products/${productId}`)
        const data = await response.json();
        console.log(data)
        return data
    }

    const {isLoading, error, data: product} = useQuery(
        { queryKey: ['product', productId], 
          queryFn: fetchProduct,
        //   staleTime: 10000,
        }
    )
    
    if(isLoading) {
        return(
            <h2 className="text-4xl">Loading...</h2>
        )
    }
    if(error) {
        return (
            <h3 className="text-4xl">Error: {error.message}</h3>
        )
    }


     if(mutation.isLoading) {
        return(
            <h2 className="text-4xl">Updating...</h2>
        )
    }
     if(mutation.error) {
        return (
            <h3 className="text-4xl">Error: {mutation.error.message}</h3>
        )
    }

    return (
        <>
        
        <div>{product.title}</div>
       <button
            onClick={() => {
              mutation.mutate({ title: 'updated product' })
            }}
          >
            Create Product
          </button>
        
        </>
    )
};

export default Product;
