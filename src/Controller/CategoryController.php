<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Entity\Category;
use App\Repository\CategoryRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
#[Route('/api')]
class CategoryController extends AbstractController
{
    #[Route('/categories', name: 'category')]
    public function showAllCategory(CategoryRepository $categoryRepository, SerializerInterface $serializer): Response
    {
       $categories = $serializer->serialize($categoryRepository->findAll(), 'json', [
        'circular_reference_handler' => function ($object) {
            return $object->getId();
        }
    ]);
       return new Response($categories, Response::HTTP_OK, ["Content-Type" => "application/json"]);
    }
}
