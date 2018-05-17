from django.db import models

# Create your models here.

class Experiment(models.Model):
	exp_name = models.CharField(max_length=50)
	exp_desc = models.CharField(max_length=200)
	create_by = models.CharField(max_length=20)
	create_date = models.DateTimeField('Date Created')

class Response(models.Model):
	exp = models.ForeignKey(Experiment,on_delete=models.CASCADE)
	name  = models.CharField(max_length=20)
	roll = models.IntegerField(default=0)
	gender = models.CharField(max_length=10)
	age = models.IntegerField(default=0)
	resp = models.CharField(max_length=300)
