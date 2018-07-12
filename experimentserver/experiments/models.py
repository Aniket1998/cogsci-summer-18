from django.db import models

# Create your models here.
class Experiment(models.Model):
	question = models.CharField(max_length=200)
	title = models.CharField(max_length=30,default='Experiment')
	focus = models.IntegerField(default=0)
	eagerness = models.IntegerField(default=0)
	arousal = models.IntegerField(default=0)

class Response(models.Model):
	exp = models.ForeignKey(Experiment,on_delete=models.CASCADE)
	name  = models.CharField(max_length=20)
	roll = models.IntegerField(default=0)
	gender = models.CharField(max_length=10)
	age = models.IntegerField(default=0)
	happy = models.IntegerField(default=0)
	sad = models.IntegerField(default=0)
	fearful = models.IntegerField(default=0)
	angry = models.IntegerField(default=0)
	surprised = models.IntegerField(default=0)
	