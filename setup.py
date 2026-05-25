from setuptools import setup, find_packages

setup(
    name='calendarius',
    version='1.0.0',
    description='Progressive Web App for task scheduling',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask',
    ],
)