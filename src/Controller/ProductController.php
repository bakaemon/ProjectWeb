<?php

namespace App\Controller;

use App\Entity\Product;
use App\Form\ProductType;
use App\Repository\CategoryRepository;
use App\Service\FileUploader;
use App\Repository\ProductRepository;
use App\Utils\DataSerializer;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/')]
class ProductController extends AbstractController
{
    #[Route('/', name: 'index', methods: ['GET'])]
    public function indexAction()
    {
        return $this->render('product/index.html.twig');
    }
    #[Route('/manage', name: 'manage', methods: ['GET'])]
    public function manageAction(SessionInterface $session)
    {
        if (!$session->has('user')) return $this->redirectToRoute('index');
        return $this->render('product/manage.html.twig');
    }
    #[Route('/api/products', name: 'product_view_all', methods: ['GET'])]
    public function showallAction(ProductRepository $productRepository, SerializerInterface $serializer): Response
    {
        $products =  $serializer->serialize($productRepository->findAll(), "json", [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            }
        ]);
        return new Response($products, Response::HTTP_OK, ["Content-Type" => "application/json"]);
    }
    #[Route('/api/product', name: 'product_view', methods: ['POST'])]
    public function showAction(ProductRepository $productRepository, Request $request, SerializerInterface $serializer): Response
    {
        $productObject = $productRepository->find($request->get('id'));
        if (!$productObject) return new Response(null, Response::HTTP_NOT_FOUND);
        $product = $serializer->serialize($productObject, "json");
        return new Response($product, Response::HTTP_OK, ["Content-Type" => "application/json"]);
    }
    #[Route('/api/new', name: 'product_new', methods: ['POST'])]
    public function newAction(Request $request, CategoryRepository $categoryRepository): Response
    {
        $category = $categoryRepository->find($request->get('category_id'));
        if (!$category) return new Response(null, Response::HTTP_BAD_REQUEST);
        $imageLink = $request->get('image');
        // $uploader = new FileUploader($this->getParameter('imageUpload'));
        // $file = $request->files->get('fileimage');
        // if ($file && !$imageLink) {
        //     $imageLink = $uploader->upload($file);
        // } else if (!$file && !$imageLink) return new Response(null, Response::HTTP_BAD_REQUEST);
        $image = $imageLink;
        $product = (new Product())
            ->setName($request->get('name'))
            ->setPrice(floatval($request->get('price')))
            ->setImage('/images/' . $image)
            ->setDescription($request->get('description'));
        $category->addProduct($product);
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($product);
        $entityManager->flush();
        return new Response(
            '{"message": "Data created successfully!"}',
            Response::HTTP_ACCEPTED,
            ["Content-Type" => "application/json"]
        );
    }
    #[Route('/api/edit', name: 'product_edit', methods: ['POST'])]
    public function editAction(Request $request, ProductRepository $productRepository, CategoryRepository $categoryRepository)
    {
        $uploader = new FileUploader($this->getParameter('imageUpload'));
        $doctrine = $this->getDoctrine();
        $entityManager = $doctrine->getManager();
        $product = $productRepository->find($request->get('id'));
        $file = $request->files->get('file');
        if ($product) {
            if ($file) {
                $fs = new Filesystem();
                $fs->remove($this->getParameter('public') . $product->getImage());
                $uploaded_path = $uploader->upload($file);
                $product->setImage('/images/' . $uploaded_path);
                $entityManager->flush();
                return new Response($uploaded_path, Response::HTTP_ACCEPTED);
            }
            if ($request->get('category_id')) {
                $newCategory = $categoryRepository->find(intval($request->get('category_id')));
                if (!$newCategory) return new Response(null, Response::HTTP_BAD_REQUEST);
                $oldCategory = $product->getCategory();
                $oldCategory->removeProduct($product);
                $newCategory->addProduct($product);
            }
            if ($request->get('name')) $product->setName($request->get('name'));
            if ($request->get('image')) $product->setName($request->get('image'));
            if ($request->get('price')) $product->setPrice(floatval($request->get('price')));
            if ($request->get('description')) $product->setDescription($request->get('description'));
        } else {
            return new Response(null, Response::HTTP_NO_CONTENT);
        }

        $entityManager->flush();
        return new Response(null, Response::HTTP_ACCEPTED);
    }

    #[Route('/api/delete', name: 'product_delete', methods: ['POST'])]
    public function deleteAction(Request $request)
    {
        $product = $this->getDoctrine()->getRepository(Product::class)->find($request->get('id'));
        $entityManager = $this->getDoctrine()->getManager();
        if (!$product) {
            return new Response(null, Response::HTTP_BAD_REQUEST);
        }
        $entityManager->remove($product);
        $entityManager->flush();
        return new Response(null, Response::HTTP_ACCEPTED);
    }
}
