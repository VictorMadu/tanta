from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .models import User


class UserRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_user_registration(self):
        url = reverse('register')
        data = {
            'email': 'testuser@example.com',
            'password': 'testpassword',
            'mobile_number': '1234567890'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'testuser@example.com')

class TokenTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword',
            mobile_number='1234567890'
        )

    def test_token_obtain(self):
        url = reverse('token_obtain_pair')
        data = {
            'email':'testuser@example.com',
            'password': 'testpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
