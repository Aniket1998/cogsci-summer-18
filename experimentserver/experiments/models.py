from django.db import models

# Create your models here.
class Experiment(models.Model):
	question = models.CharField(max_length=200)
	title = models.CharField(max_length=30,default='Experiment')
	focus1 = models.IntegerField(default=-1, db_column='focus')
	eagerness1 = models.IntegerField(default=-1, db_column='eagerness')
	arousal1 = models.IntegerField(default=-1, db_column='arousal')
	focus2 = models.IntegerField(default=-1)
	eagerness2 = models.IntegerField(default=-1)
	arousal2 = models.IntegerField(default=-1)
	focus3 = models.IntegerField(default=-1)
	eagerness3 = models.IntegerField(default=-1)
	arousal3 = models.IntegerField(default=-1)

class Response(models.Model):
	exp = models.ForeignKey(Experiment,on_delete=models.CASCADE)
	name  = models.CharField(max_length=20)
	roll = models.IntegerField(default=-1)
	gender = models.CharField(max_length=10)
	age = models.IntegerField(default=-1)
	happy1 = models.IntegerField(default=-1, db_column='happy')
	sad1 = models.IntegerField(default=-1, db_column='sad')
	fearful1 = models.IntegerField(default=-1, db_column='fearful')
	angry1 = models.IntegerField(default=-1, db_column='angry')
	surprised1 = models.IntegerField(default=-1, db_column='surprised')
	happy2 = models.IntegerField(default=-1)
	sad2 = models.IntegerField(default=-1)
	fearful2 = models.IntegerField(default=-1)
	angry2 = models.IntegerField(default=-1)
	surprised2 = models.IntegerField(default=-1)
	happy3 = models.IntegerField(default=-1)
	sad3 = models.IntegerField(default=-1)
	fearful3 = models.IntegerField(default=-1)
	angry3 = models.IntegerField(default=-1)
	surprised3 = models.IntegerField(default=-1)
	