from django.shortcuts import render,redirect,get_object_or_404
from .models import Experiment,Response
from django.http import HttpResponse, JsonResponse
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
def front_view(request):
	exp_list = Experiment.objects.all()
	return render(request,'experiments/frontpage.html',{'exp_list' : exp_list})

@csrf_exempt
def form2_1(request):
	#exp = get_object_or_404(Experiment,pk="2")
	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
	if request.method == 'POST' and request.is_ajax():
		exp.response_set.create(name = request.POST['name'],roll = request.POST['roll'],gender = request.POST['gender'],
		age = request.POST['age'],happy1 = request.POST['happy1'],sad1 = request.POST['sad1'],fearful1 = request.POST['fearful1'],
		angry1 = request.POST['angry1'],surprised1 = request.POST['surprised1'])

	return JsonResponse({'status': 'ok'})

@csrf_exempt
def form2_2(request):
	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
	if request.method == 'POST' and request.is_ajax():
		exp.response_set.create(name = request.POST['name'],roll = request.POST['roll'],gender = request.POST['gender'],
		age = request.POST['age'],happy2 = request.POST['happy2'],sad2 = request.POST['sad2'],fearful2 = request.POST['fearful2'],
		angry2 = request.POST['angry2'],surprised2 = request.POST['surprised2'])

	return JsonResponse({'status': 'ok'})
		
def exp1_view(request):
	exp = get_object_or_404(Experiment,pk="1")
	
	context = {
		'expid' : exp.pk,
		'title' : exp.title,
		'question' : exp.question,
		'name' : request.POST['Name'],
		'roll' : request.POST['RollNo'],
		'age' : request.POST['Age'],
		'gender' : request.POST['Gender']
	}
	return render(request,'experiments/exp' + str(exp.pk) + '.html',context)

def exp2_view(request):
	exp = get_object_or_404(Experiment,pk="1")
	exp.response_set.create(name = request.POST['Name'],roll = request.POST['RollNo'],gender = request.POST['Gender'],
		age = request.POST['Age'],happy1 = request.POST['happy'],sad1 = request.POST['sad'],fearful1 = request.POST['fearful'],
		angry1 = request.POST['angry'],surprised1 = request.POST['surprised'])
	exp = get_object_or_404(Experiment,pk="2")

	context = {
		'expid' : exp.pk,
		'title' : exp.title,
		'question' : exp.question,
		'name' : request.POST['Name'],
		'roll' : request.POST['RollNo'],
		'age' : request.POST['Age'],
		'gender' : request.POST['Gender']
	}
	return render(request,'experiments/exp' + str(exp.pk) + '.html',context)

def exp3_view(request):
	exp = get_object_or_404(Experiment,pk="2")
	exp.response_set.create(name = request.POST['Name'],roll = request.POST['RollNo'],gender = request.POST['Gender'],
		age = request.POST['Age'],happy3 = request.POST['happy3'],sad3 = request.POST['sad3'],fearful3 = request.POST['fearful3'],
		angry3 = request.POST['angry3'],surprised3 = request.POST['surprised3'])

	exp = get_object_or_404(Experiment,pk="3")

	context = {
		'expid' : exp.pk,
		'title' : exp.title,
		'question' : exp.question,
		'name' : request.POST['Name'],
		'roll' : request.POST['RollNo'],
		'age' : request.POST['Age'],
		'gender' : request.POST['Gender']
	}
	return render(request,'experiments/exp' + str(exp.pk) + '.html',context)

def exp4_view(request):
	exp = get_object_or_404(Experiment,pk="3")
	exp.response_set.create(name = request.POST['Name'],roll = request.POST['RollNo'],gender = request.POST['Gender'],
		age = request.POST['Age'],happy2 = request.POST['happy2'],sad2 = request.POST['sad2'],fearful2 = request.POST['fearful2'],
		angry2 = request.POST['angry2'],surprised2 = request.POST['surprised2'])

	exp = get_object_or_404(Experiment,pk="4")

	context = {
		'expid' : exp.pk,
		'title' : exp.title,
		'question' : exp.question,
		'name' : request.POST['Name'],
		'roll' : request.POST['RollNo'],
		'age' : request.POST['Age'],
		'gender' : request.POST['Gender']
	}
	return render(request,'experiments/exp' + str(exp.pk) + '.html',context)

def submit_view(request):
	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
	exp.response_set.create(name = request.POST['Name'],roll = request.POST['RollNo'],gender = request.POST['Gender'],
		age = request.POST['Age'],happy2 = request.POST['happy2'],sad2 = request.POST['sad2'],fearful2 = request.POST['fearful2'],
		angry2 = request.POST['angry2'],surprised2 = request.POST['surprised2'])

	return HttpResponse('Thanks for participating!')