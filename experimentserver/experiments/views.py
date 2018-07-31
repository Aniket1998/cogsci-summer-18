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
	exp = get_object_or_404(Experiment,pk="2")
	if request.method == 'POST':
		print(request.POST['happy1'])
		# exp.response_set.create(name = request.POST['name'],roll = request.POST['roll'],gender = request.POST['gender'],
		# age = request.POST['age'],happy = request.POST['happy1'],sad = request.POST['sad1'],fearful = request.POST['fearful1'],
		# angry = request.POST['angry1'],surprised = request.POST['surprised1'])
	return JsonResponse({'status': 'ok'})

@csrf_exempt
def form2_2(request):
	exp = get_object_or_404(Experiment,pk="2")
	if request.method == 'POST':
		exp.response_set.create(happy = request.POST['happy'],sad = request.POST['sad'],fearful = request.POST['fearful'],
		angry = request.POST['angry'],surprised = request.POST['surprised'])
	# return JsonResponse({'status': 'ok'})
	return JsonResponse({'status': 'ok'})


# def form2_3(request):
# 	exp = get_object_or_404(Experiment,pk="2")
# 	if request.method == 'POST':
# 		exp.response_set.create(name = request.POST['Name'],roll = request.POST['RollNo'],gender = request.POST['Gender'],
# 		age = request.POST['Age'],happy3 = request.POST['happy'],sad3 = request.POST['sad'],fearful3 = request.POST['fearful'],
# 		angry3 = request.POST['angry'],surprised3 = request.POST['surprised'])
		
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
		age = request.POST['Age'],happy = request.POST['happy'],sad = request.POST['sad'],fearful = request.POST['fearful'],
		angry = request.POST['angry'],surprised = request.POST['surprised'])
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
		age = request.POST['Age'],happy = request.POST['happy3'],sad = request.POST['sad3'],fearful = request.POST['fearful3'],
		angry = request.POST['angry3'],surprised = request.POST['surprised3'])

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

def submit_view(request):
	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
	exp.response_set.create(name = request.POST['Name'],roll = request.POST['RollNo'],gender = request.POST['Gender'],
		age = request.POST['Age'],happy = request.POST['happy'],sad = request.POST['sad'],fearful = request.POST['fearful'],
		angry = request.POST['angry'],surprised = request.POST['surprised'])
	return HttpResponse('Thanks for participating!')