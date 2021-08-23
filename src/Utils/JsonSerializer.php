<?php
namespace App\Utils;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;

class DataSerializer
{
    public function __construct()
    {
        $this->normalizer = new ObjectNormalizer();
        $this->encoder = new JsonEncoder();
    }
    public function getJsonSerializer()
    {
        return new Serializer([$this->normalizer], [$this->encoder]);
    }
}