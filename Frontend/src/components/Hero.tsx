
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Book, Code, Terminal, Brain, Users, Zap, Puzzle, Layout, Globe, Star, Award, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, link }: { 
  icon: any; 
  title: string; 
  description: string;
  link: string;
}) => (
  <Link to={link}>
    <Card className="h-full transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-br from-white to-gray-50 hover-card-shine">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export const Hero = () => {
  return (
    <div className="min-h-screen">
      <div className="pt-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              An  
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                {" "}
                Integrated Platform
              </span>{" "}
              for Developers
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master web development, algorithms, and coding practices with our comprehensive 
              learning platform featuring AI assistance and interactive challenges.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/learn">
              <Button size="lg" className="group">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/playground">
              <Button size="lg" variant="outline" className="group">
                Try Playground
                <Code className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
          <div className="max-w-3xl mx-auto space-y-6 text-gray-600">
            <p>
              At DevX, we envision a world where coding education is accessible, interactive, and effective for everyone. 
              We're building a platform that breaks down barriers to entry in tech and creates a vibrant community of developers 
              supporting each other's growth.
            </p>
            <p>
              Our mission is to democratize access to high-quality programming education and provide a comprehensive suite of tools 
              that help developers at all stages of their journey—from beginners writing their first lines of code to experienced 
              professionals preparing for technical interviews.
            </p>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-xl shadow-sm"
          >
            <div className="p-3 bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center mb-5">
              <Globe className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Accessibility</h3>
            <p className="text-gray-600">
              We're committed to making high-quality developer education accessible worldwide, regardless of geographic or economic barriers.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-xl shadow-sm"
          >
            <div className="p-3 bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-5">
              <Star className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Excellence in Education</h3>
            <p className="text-gray-600">
              We're raising the bar on coding education by combining expert-crafted content with cutting-edge AI assistance and hands-on practice.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl shadow-sm"
          >
            <div className="p-3 bg-green-100 rounded-full w-14 h-14 flex items-center justify-center mb-5">
              <Rocket className="h-7 w-7 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Future Innovation</h3>
            <p className="text-gray-600">
              Our roadmap includes pioneering new learning methodologies, interactive coding challenges, and AI-powered mentorship at scale.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Master Coding</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive learning paths, interactive challenges, and real-world projects
            to help you become a professional developer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Book}
            title="MERN Stack Learning"
            description="Comprehensive tutorials covering MongoDB, Express.js, React, and Node.js with hands-on examples."
            link="/learn"
          />
          
          <FeatureCard
            icon={Brain}
            title="DSA Interview Prep"
            description="Top 100 Data Structures and Algorithms questions with detailed explanations and solutions."
            link="/dsa-questions"
          />
          
          <FeatureCard
            icon={Terminal}
            title="Interactive Playground"
            description="Practice coding in real-time with our interactive code editor and immediate feedback."
            link="/playground"
          />
          
          <FeatureCard
            icon={Users}
            title="Community Support"
            description="Connect with fellow developers, share knowledge, and collaborate on projects."
            link="/community"
          />
          
          <FeatureCard
            icon={Zap}
            title="AI-Powered Support"
            description="Get instant help and code reviews from our AI assistant to accelerate your learning."
            link="/playground"
          />
          
          <FeatureCard
            icon={Puzzle}
            title="Coding Challenges"
            description="Regular coding challenges to improve your problem-solving skills and algorithmic thinking."
            link="/playground"
          />
        </div>

        {/* Future Roadmap */}
        <div className="mt-24">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Future Roadmap</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're constantly innovating and expanding our platform to better serve the developer community.
              Here's what we're working on:
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/20 to-primary/60"></div>
            
            <div className="grid grid-cols-1 gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center"
              >
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-12">
                  <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-3 text-primary">Advanced Learning Paths</h3>
                    <p className="text-gray-600">
                      We're developing specialized tracks for cloud computing, machine learning, and mobile app development,
                      complete with certifications recognized by industry leaders.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Award className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row-reverse items-center"
              >
                <div className="md:w-1/2 mb-6 md:mb-0 md:pl-12">
                  <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-3 text-primary">Collaborative Coding Environment</h3>
                    <p className="text-gray-600">
                      We're building tools for real-time collaboration, allowing teams to code together, 
                      share knowledge, and solve complex problems collectively.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center"
              >
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-12">
                  <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-3 text-primary">Industry Partnerships</h3>
                    <p className="text-gray-600">
                      We're forging partnerships with tech companies to create job-ready programs and 
                      direct pathways to employment opportunities for our most dedicated learners.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Layout className="h-12 w-12 text-green-500" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Built with Modern Technologies</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Learn and build with the latest web development technologies used by top companies.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <Link to="/learn/mongodb" className="group">
              <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <h3 className="font-semibold group-hover:text-primary">MongoDB</h3>
                <p className="text-sm text-gray-600">NoSQL Database</p>
              </div>
            </Link>
            
            <Link to="/learn/express" className="group">
              <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <h3 className="font-semibold group-hover:text-primary">Express.js</h3>
                <p className="text-sm text-gray-600">Web Framework</p>
              </div>
            </Link>
            
            <Link to="/learn/react" className="group">
              <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <h3 className="font-semibold group-hover:text-primary">React</h3>
                <p className="text-sm text-gray-600">UI Library</p>
              </div>
            </Link>
            
            <Link to="/learn/nodejs" className="group">
              <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <h3 className="font-semibold group-hover:text-primary">Node.js</h3>
                <p className="text-sm text-gray-600">Runtime Environment</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of developers who are already growing with DevX.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <span className="font-bold text-primary">AK</span>
                </div>
                <div>
                  <h4 className="font-semibold">Alex Kumar</h4>
                  <p className="text-sm text-gray-500">Frontend Developer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The interactive challenges and AI feedback helped me level up my React skills in ways I couldn't achieve through tutorials alone."
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="font-bold text-blue-500">SJ</span>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Full Stack Developer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The DSA interview prep module helped me land my dream job at a major tech company. The explanation of complex algorithms is unmatched."
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span className="font-bold text-green-500">MP</span>
                </div>
                <div>
                  <h4 className="font-semibold">Michael Patel</h4>
                  <p className="text-sm text-gray-500">Student Developer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "As a self-taught developer, DevX filled critical gaps in my knowledge and gave me the confidence to tackle real-world projects."
              </p>
            </motion.div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-400/10">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of developers who are already learning and building with our platform.
            </p>
            <Link to="/dsa-questions">
              <Button size="lg" className="group">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
