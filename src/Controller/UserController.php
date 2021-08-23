<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\User;

class UserController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, SessionInterface $session): Response
    {
        $username = $request->get('username');
        $password = $request->get('password');
        $doctrine = $this->getDoctrine();
        $users = $doctrine->getRepository(User::class)->findBy(array("username" => $username), null, 1);
        $u_err = '{"username-error": "Username ' . $username . ' doesn\'t existed."}';
        $p_err = '{"password-error": "The password is incorrect."}';
        if (sizeof($users) == 0) 
            return new Response($u_err, Response::HTTP_FORBIDDEN);
        $user = $users[0];
        if ($password != $user->getPassword())
            return new Response($p_err, Response::HTTP_FORBIDDEN, ["Content-Type" => "application/json"]);
        
        $session->set('user', ['username' => $username, 'role' => $user->getRole()]);
        return new Response(null, Response::HTTP_ACCEPTED);
    }
    #[Route('/signup', name: 'signup', methods: ['POST'])]
    public function signup(Request $request): Response
    {
        $username = $request->get('username');
        $password = $request->get('password');
        $doctrine = $this->getDoctrine();
        $users = $doctrine->getRepository(User::class)->findBy(array("username" => $username), null, 1);
        $u_err = '{"username-error": "Username ' . $username . ' has already existed."}';
        if (sizeof($users) > 0) return new Response(
            $u_err,
            Response::HTTP_NOT_ACCEPTABLE,
            ["Content-Type" => "application/json"]
        );
        $newUser = (new User())
            ->setUsername($username)
            ->setPassword($password)
            ->setRole("customer");
        $manager = $doctrine->getManager();
        $manager->persist($newUser);
        $manager->flush();
        return new Response(null, Response::HTTP_ACCEPTED);
    }

    #[Route('/logout', name: 'logout', methods: ['GET'])]
    public function logout(SessionInterface $session) {
        $session->remove('user');
        return $this->redirectToRoute('index', ["login" => null]);
    }
}
